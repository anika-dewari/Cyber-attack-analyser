const { spawn } = require('child_process');
const Scan = require('../models/Scan');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Create and run a new scan
const createScan = async (req, res) => {
    try {
        console.log('Received scan request:', { body: req.body, params: req.params });
        const { target } = req.body;
        const { type } = req.params;
        const userId = req.user._id;

        if (!target) {
            console.log('Error: Target URL is missing');
            return res.status(400).json({ error: 'Target URL is required' });
        }

        // Map scan types to their corresponding Python script files
        const scriptMap = {
            'clickjacking': 'ClickJacking.py',
            'xss': 'XSS.py',
            'sql': 'SQLI.py',
            'malicious': 'MaliciousUrl.py',
            'port': 'port_scanner.py',
            'cve': 'cve_api_search.py'
        };

        const pythonScript = scriptMap[type];
        if (!pythonScript) {
            console.log('Error: Invalid scan type:', type);
            return res.status(400).json({ error: 'Invalid scan type' });
        }

        // Get the absolute path to the Python script
        const scriptPath = path.join(__dirname, '..', pythonScript);
        console.log('Executing Python script:', scriptPath);
        console.log('Target URL:', target);

        // Check if Python script exists
        if (!fs.existsSync(scriptPath)) {
            console.error('Python script not found:', scriptPath);
            return res.status(500).json({ error: 'Scan script not found' });
        }

        // Get Python executable path
        const pythonPath = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
        console.log('Using Python from:', pythonPath);

        const pythonProcess = spawn(pythonPath, [scriptPath, target]);
        
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Python stdout:', output);
            result += output;
        });

        pythonProcess.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            console.error('Python stderr:', errorOutput);
            error += errorOutput;
        });

        pythonProcess.on('error', (err) => {
            console.error('Failed to start Python process:', err);
            return res.status(500).json({ 
                error: 'Failed to start scan process',
                details: err.message
            });
        });

        pythonProcess.on('close', async (code) => {
            console.log('Python process exited with code:', code);
            
            if (code !== 0) {
                console.error('Python script failed with error:', error);
                return res.status(500).json({ 
                    error: error || 'Scan failed',
                    details: 'Python script execution failed'
                });
            }

            try {
                console.log('Raw Python output:', result);
                let scanResult;
                try {
                    scanResult = JSON.parse(result);
                    console.log('Parsed scan result:', scanResult);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    scanResult = { raw_output: result };
                }

                // Create scan record
                const scan = new Scan({
                    target,
                    type,
                    result: scanResult,
                    user: userId,
                    vulnerable: scanResult.vulnerable || false,
                    vulnerabilities: scanResult.vulnerabilities || []
                });

                await scan.save();
                console.log('Scan saved to database:', scan._id);

                // Add scan to user's history
                await User.findByIdAndUpdate(userId, {
                    $push: { scanHistory: scan._id }
                });
                console.log('Scan added to user history');

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
        const userId = req.user._id;
        const scans = await Scan.find({ user: userId })
            .sort({ createdAt: -1 })
            .select('target type result vulnerable vulnerabilities createdAt');
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