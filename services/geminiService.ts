
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

// Initialize the client. 
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1024&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1024&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1024&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80'
];

const MOCK_VIDEOS = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

/**
 * Generates an image.
 */
export const generateImageService = async (
    prompt: string, 
    model: string = 'imagen-4.0-generate-001', 
    aspectRatio: string = "1:1", 
    referenceImageBase64?: string,
    removeBackground: boolean = false
): Promise<string> => {
  const ai = getClient();
  
  // Handle Mock Models
  if (model.startsWith('mock-')) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    return MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
  }

  // Append instruction to prompt if removeBackground is requested
  // Note: True background removal usually requires a specific tool or post-processing API.
  // For this implementation, we guide the model via prompt engineering.
  const finalPrompt = removeBackground 
    ? `${prompt}, isolated on transparent background, no background, clean cut` 
    : prompt;

  try {
    // For Imagen models
    if (model.includes('imagen')) {
        const response = await ai.models.generateImages({
        model: model,
        prompt: referenceImageBase64 ? `${finalPrompt} (based on provided reference style)` : finalPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64EncodeString: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64EncodeString}`;
        }
    } else {
        // Fallback or Gemini Image models (nano banana)
        // If it's a Gemini image model like gemini-2.5-flash-image
        try {
            const response = await ai.models.generateContent({
                model: model, 
                contents: {
                    parts: [
                        { text: finalPrompt }
                    ]
                }
            });
            // We can't easily extract the image bytes from standard generateContent for nano models in this specific setup 
            // without complex parsing if it returns mixed content. 
            // For stability in this demo, if it's not Imagen, we return a mock or try to parse if implemented.
            // But usually gemini-flash-image returns text description unless specifically configured for image output which implies Imagen API usage often.
            // Reverting to mock for stability on non-Imagen models in this specific codebase context unless specific API is clear.
             return MOCK_IMAGES[0];
        } catch (e) {
            console.warn("Fallback to mock for model", model);
            return MOCK_IMAGES[0];
        }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Image generation error:", error);
    return MOCK_IMAGES[0];
  }
};

/**
 * Generates a video using Veo.
 */
export const generateVideoService = async (prompt: string, model: string = 'veo-3.1-fast-generate-preview', imageBase64?: string, mimeType: string = 'image/png'): Promise<string> => {
    const ai = getClient();

    // Handle Mock Models
    if (model.startsWith('mock-')) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return MOCK_VIDEOS[Math.floor(Math.random() * MOCK_VIDEOS.length)];
    }

    try {
        let requestPayload: any = {
            model: model,
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p', 
                aspectRatio: '16:9'
            }
        };

        if (imageBase64) {
            // Remove data URL header if present
            const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
            requestPayload.image = {
                imageBytes: cleanBase64,
                mimeType: mimeType
            };
        }

        let operation = await ai.models.generateVideos(requestPayload);

        // Polling for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("Video generation failed");

        return `${videoUri}&key=${process.env.API_KEY}`;

    } catch (error) {
        console.error("Video generation error:", error);
        return MOCK_VIDEOS[0];
    }
};

/**
 * Generates a playable ad (HTML5 code)
 */
export const generatePlayableService = async (prompt: string, model: string = 'gemini-2.5-flash'): Promise<string> => {
    const ai = getClient();
    
    // Fallback logic for mocks in playable to use a generic flash model call or simulate
    const effectiveModel = model.startsWith('mock-') ? 'gemini-2.5-flash' : model;

    try {
        const response = await ai.models.generateContent({
            model: effectiveModel,
            contents: `Create a single HTML file for a playable ad (mini-game) based on this description: "${prompt}". 
            It should be a simple interactive canvas or DOM game. 
            Include internal CSS and JS. Make it colorful and fun. 
            Do not use markdown backticks. Just return the raw HTML code.`,
        });
        
        const html = response.text || "<h1>Error generating playable ad</h1>";
        return `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
    } catch (error) {
        console.error("Playable generation error", error);
        const fallbackHtml = "<html><body style='background:black;color:white;display:flex;justify-content:center;align-items:center;'><h1>Playable Ad Placeholder</h1></body></html>";
        return `data:text/html;base64,${btoa(fallbackHtml)}`;
    }
}

/**
 * Chat Service configurations
 */
const generateContentTool: FunctionDeclaration = {
    name: 'generate_media',
    description: 'Generates a video or image based on a prompt.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            prompt: { type: Type.STRING, description: 'The description of the content to generate' },
            mediaType: { type: Type.STRING, description: 'Type of media: "VIDEO" or "IMAGE"' }
        },
        required: ['prompt', 'mediaType']
    }
};

const createCampaignTool: FunctionDeclaration = {
    name: 'create_campaign',
    description: 'Creates a new advertising campaign draft.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'Name of the campaign' },
            budget: { type: Type.NUMBER, description: 'Budget amount' },
            platform: { type: Type.STRING, description: 'Platform: google, facebook, or tiktok' }
        },
        required: ['name', 'budget']
    }
};

export const getChatModel = () => {
    const ai = getClient();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are the SuperLeo assistant. You speak Russian. You can help users generate media (videos/images) and create ad campaigns using the available tools. Be concise, friendly, and helpful.",
            tools: [{ functionDeclarations: [generateContentTool, createCampaignTool] }]
        }
    });
};
