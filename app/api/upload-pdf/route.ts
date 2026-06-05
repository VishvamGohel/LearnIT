import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { pipeline, env } from '@xenova/transformers';

export const maxDuration = 60; // Max allowed for Vercel Hobby

// Disable local models loading in production, if needed, but for now we let it download to cache
env.allowLocalModels = false;
env.useBrowserCache = false;

// Singleton to hold the pipeline so it's not reloaded on every request
let extractorPipeline: any = null;

async function getExtractor() {
  if (!extractorPipeline) {
    // all-MiniLM-L6-v2 is a great balance of size (22MB) and performance for semantic search
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPipeline;
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

    // Get the embeddings pipeline
    const extractor = await getExtractor();

    // Process chunks and generate embeddings
    const documentChunks = [];
    
    // We process sequentially here to avoid memory spikes, but could use Promise.all in batches
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding: output is a Tensor
      const output = await extractor(chunk, { pooling: 'mean', normalize: true });
      
      // Convert Tensor to standard JS array
      const embeddingArray = Array.from(output.data);

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
