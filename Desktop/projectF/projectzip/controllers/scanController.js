const { spawn } = require('child_process');
const Scan = require('../models/Scan');
const User = require('../models/User');
const path = require('path');

// Create and run a new scan
const createScan = async (req, res) => {
    try {
        const { target, type } = req.body;
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!type || !target) {
            return res.status(400).json({ error: 'Scan type and target are required' });
        }

        // Map scan types to their corresponding Python script files
        const scriptMap = {
            'port': 'port_scanner.py',
            'xss': 'XSS.py',
            'sql': 'SQLI.py',
            'malicious': 'MaliciousUrl.py',
            'clickjacking': 'ClickJacking.py',
            'cve': 'cve_api_search.py'
        };

        const pythonScript = scriptMap[type];
        if (!pythonScript) {
            return res.status(400).json({ error: 'Invalid scan type' });
        }

        // Get the absolute path to the Python script
        const scriptPath = path.join(__dirname, '..', pythonScript);
        console.log('Executing Python script:', scriptPath);

        const pythonProcess = spawn('python', [scriptPath, target]);
        
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            console.log('Python stdout:', data.toString());
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
            error += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            console.log('Python process exited with code:', code);
            
            if (code !== 0) {
                return res.status(500).json({ 
                    error: error || 'Scan failed',
                    details: 'Python script execution failed'
                });
            }

            try {
                let scanResult;
                try {
                    scanResult = JSON.parse(result);
                } catch (e) {
                    scanResult = { raw_output: result };
                }

                // Create scan record
                const scan = new Scan({
                    target,
                    type,
                    result: scanResult,
                    user: userId
                });

                await scan.save();

                // Add scan to user's history
                await User.findByIdAndUpdate(userId, {
                    $push: { scanHistory: scan._id }
                });

                res.status(201).json(scan);
            } catch (error) {
                console.error('Error saving scan:', error);
                res.status(500).json({ error: error.message });
            }
        });
    } catch (error) {
        console.error('Error creating scan:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user's scan history
const getScanHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const scans = await Scan.find({ user: userId })
            .sort({ createdAt: -1 });
        res.json(scans);
    } catch (error) {
        console.error('Error fetching scan history:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createScan,
    getScanHistory
}; 