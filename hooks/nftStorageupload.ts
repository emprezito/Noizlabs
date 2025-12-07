import { NFTStorage, File } from 'nft.storage';

// Get your API key from https://nft.storage/
const NFT_STORAGE_KEY = 'df8dcf09.0621773fa0ed4d3ea40ecf8abd5f39f9';

/**
 * Upload audio file and metadata to NFT.Storage
 * @param audioFile - The audio file to upload
 * @param name - Token name
 * @param symbol - Token symbol
 * @param description - Token description
 * @returns The IPFS URL for the metadata JSON
 */
export async function uploadAudioTokenMetadata(
  audioFile: globalThis.File,
  name: string,
  symbol: string,
  description: string,
  imageFile?: globalThis.File, // Optional cover image
  attributes?: Array<{ trait_type: string; value: string }>
): Promise<string> {
  try {
    const client = new NFTStorage({ token: NFT_STORAGE_KEY });
    
    console.log('📤 Uploading audio file to IPFS...');
    
    // 1. Upload audio file
    const audioBuffer = await audioFile.arrayBuffer();
    const audioNFTFile = new File([audioBuffer], audioFile.name, {
      type: audioFile.type,
    });
    const audioCid = await client.storeBlob(audioNFTFile);
    const audioUrl = `https://nftstorage.link/ipfs/${audioCid}`;
    
    console.log('✅ Audio uploaded:', audioUrl);
    
    // 2. Upload image if provided
    let imageUrl = '';
    if (imageFile) {
      console.log('📤 Uploading image to IPFS...');
      const imageBuffer = await imageFile.arrayBuffer();
      const imageNFTFile = new File([imageBuffer], imageFile.name, {
        type: imageFile.type,
      });
      const imageCid = await client.storeBlob(imageNFTFile);
      imageUrl = `https://nftstorage.link/ipfs/${imageCid}`;
      console.log('✅ Image uploaded:', imageUrl);
    }
    
    // 3. Create metadata JSON
    const metadata = {
      name,
      symbol,
      description,
      image: imageUrl || audioUrl, // Use image if provided, otherwise audio
      animation_url: audioUrl,
      external_url: `https://noizlabs.io/token/${symbol}`,
      attributes: attributes || [
        {
          trait_type: 'Category',
          value: 'Audio Token',
        },
        {
          trait_type: 'Creator',
          value: 'NoizLabs',
        },
      ],
      properties: {
        files: [
          {
            uri: audioUrl,
            type: audioFile.type || 'audio/mpeg',
          },
        ],
        category: 'audio',
      },
    };
    
    console.log('📤 Uploading metadata to IPFS...');
    
    // 4. Upload metadata JSON
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });
    const metadataNFTFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json',
    });
    const metadataCid = await client.storeBlob(metadataNFTFile);
    const metadataUrl = `https://nftstorage.link/ipfs/${metadataCid}`;
    
    console.log('✅ Metadata uploaded:', metadataUrl);
    
    return metadataUrl;
  } catch (error) {
    console.error('❌ Error uploading to NFT.Storage:', error);
    throw error;
  }
}

/**
 * Simple upload function for just audio + basic info
 */
export async function uploadSimpleAudioMetadata(
  audioFile: globalThis.File,
  name: string,
  symbol: string
): Promise<string> {
  return uploadAudioTokenMetadata(
    audioFile,
    name,
    symbol,
    `${name} - Audio meme token on Solana`
  );
}

// Example usage in your component:
/*
import { uploadAudioTokenMetadata } from './nftStorageUpload';

const handleMintToken = async () => {
  try {
    // 1. Upload to NFT.Storage first
    const metadataUri = await uploadAudioTokenMetadata(
      audioFile,
      tokenName,
      tokenSymbol,
      tokenDescription,
      imageFile, // optional
      [ // optional custom attributes
        { trait_type: 'Duration', value: '2 seconds' },
        { trait_type: 'Genre', value: 'Meme' }
      ]
    );
    
    // 2. Now create the token with the metadata URI
    const tx = await program.methods
      .createAudioTokenWithCurve(
        tokenName,
        tokenSymbol,
        metadataUri, // Use the IPFS URL here
        totalSupply,
        initialPrice
      )
      .accounts({
        // ... your accounts
      })
      .rpc();
      
    console.log('✅ Token created:', tx);
  } catch (error) {
    console.error('Error:', error);
  }
};
*/