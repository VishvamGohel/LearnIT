import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

// Gemini embedding client — uses gemini-embedding-001 (768 dimensions)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Helper function to chunk text
// Splits text into chunks of approx `chunkSize` characters, with `overlap` characters
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    // Mock browser globals required by pdf-parse's underlying pdf.js in Node environment
    if (typeof global !== 'undefined') {
      if (!global.DOMMatrix) {
        (global as any).DOMMatrix = class DOMMatrix {};
      }
      if (!global.Path2D) {
        (global as any).Path2D = class Path2D {};
      }
      if (!global.ImageData) {
        (global as any).ImageData = class ImageData {};
      }
    }

    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const roadmapId = formData.get('roadmapId') as string;

    if (!file || !roadmapId) {
      return NextResponse.json({ error: 'File and roadmapId are required' }, { status: 400 });
    }

    // Convert the File to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF using v1 API
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: 'No readable text found in PDF' }, { status: 400 });
    }

    // Clean and chunk the text
    const cleanText = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    const chunks = chunkText(cleanText, 1000, 200);

    // Process chunks and generate embeddings via Gemini API
    const documentChunks = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embeddingArray = await getEmbedding(chunk);

      documentChunks.push({
        roadmap_id: roadmapId,
        chunk_index: i,
        content: chunk,
        embedding: embeddingArray
      });
    }

    // Store in Supabase
    const { error } = await supabase
      .from('document_chunks')
      .insert(documentChunks);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save document chunks to database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${chunks.length} chunks successfully`,
      totalChunks: chunks.length,
      extractedTextPreview: cleanText.substring(0, 1000) // Send a preview back for roadmap generation
    });

  } catch (error: any) {
    console.error('PDF Processing Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error processing PDF' }, { status: 500 });
  }
}
