// Environment variable validation and debugging utility

export function validateEnvironment() {
  const requiredEnvVars = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  };

  const missing: string[] = [];
  const present: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    present,
    summary: missing.length === 0 
      ? 'All environment variables are configured' 
      : `Missing environment variables: ${missing.join(', ')}`
  };
}

export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    elevenLabsKeyLength: process.env.ELEVENLABS_API_KEY?.length || 0,
  };
} 