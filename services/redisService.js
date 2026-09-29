const { Redis } = require('@upstash/redis');

let redis = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Upstash Redis initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Redis:', error.message);
    }
} else {
    console.log('⚠️ Redis ENV variables missing. Bypassing cache (Fallback to MongoDB).');
}

module.exports = redis;