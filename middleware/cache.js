const { getJSON, setJSON } = require('../backend/redis-client');

function defaultKeyBuilder(req) {
  return `cache:${req.method}:${req.baseUrl || ''}${req.path}?${new URLSearchParams(req.query).toString()}`;
}

function cache(ttlSeconds=60, keyBuilder=defaultKeyBuilder){
    return async function cacheMiddleware(req,res,next){
        try{
            const key = keyBuilder(req);
            const cached = await getJSON(key);

            if(cached){
                res.set('X-Cache', 'HIT');
                return res.json(cached);
            }

            const originalJson = res.json.bind(res);

            res.json = async (body) => {
                try{
                    if(res.statusCode === 200 && (Array.isArray(body) || typeof body === 'object')){
                        await setJSON(key, body, ttlSeconds);
                        res.set('X-Cache','MISS');
                    }
                }catch(e){
                    console.error('[Cache] set error: ', e);
                }

                return originalJson;
            }

            next();
        }catch(e){
            console.error('[Cache] Middleware error: ', e);
        }
    }
}

module.exports = { cache, defaultKeyBuilder }