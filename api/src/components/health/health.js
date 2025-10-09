/**
 * Health check endpoint that returns system status
 * Used by AWS ECS for container health checks
 */
const Health = (req, res) => {
    // Return more detailed health information
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json(health);
};

export default Health;
