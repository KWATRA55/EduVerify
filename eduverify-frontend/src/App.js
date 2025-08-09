import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  School, 
  VerifiedUser as Verified, 
  Dangerous as Revoked,
  CloudUpload,
  GppGood,
  Cancel,
  CheckCircle,
  AutoAwesome
} from '@mui/icons-material';
import './App.css';


function App() {
  // State management
  const [certificates, setCertificates] = useState([]);
  const [studentAddress, setStudentAddress] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [file, setFile] = useState(null);
  const [issueStudent, setIssueStudent] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch certificates
  const fetchCertificates = async (address = studentAddress) => {
    try {
      const response = await axios.get(`http://localhost:3008/certificates/${address}`);
      setCertificates(response.data);
    } catch (error) {
      showSnackbar('Error fetching certificates', 'error');
    }
  };

  // Certificate issuance (optimized)
  const handleIssue = async () => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const { ipfsHash } = (await axios.post('http://localhost:3008/upload', formData)).data;

      try {
        await axios.post('http://localhost:3008/issue', { student: issueStudent, ipfsHash, expiresAt: 0 });
      } catch (error) {
        if (error.response?.data?.error?.includes('not a registered student')) {
          await axios.post('http://localhost:3008/register-student', { student: issueStudent });
          await axios.post('http://localhost:3008/issue', { student: issueStudent, ipfsHash, expiresAt: 0 });
        } else throw error;
      }

      showSnackbar('Certificate issued successfully!', 'success');
      setIssueStudent('');
      setFile(null);
      fetchCertificates(issueStudent); // Refresh view
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Issuance failed', 'error');
    }
  };

  // Revoke certificate
  const handleRevoke = async () => {
    try {
      await axios.post('http://localhost:3008/revoke', {
        student: selectedCert.issuedTo,
        index: certificates.findIndex(c => c.ipfsHash === selectedCert.ipfsHash)
      });
      showSnackbar('Certificate revoked!', 'success');
      setOpenDialog(false);
      fetchCertificates(selectedCert.issuedTo);
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Revocation failed', 'error');
    }
  };

  // Verify certificate
  const handleVerify = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3008/verify/${studentAddress}/0/${verifyHash}`
      );
      setVerificationResult(res.data.isValid ? 'Valid' : 'Invalid');
    } catch (error) {
      showSnackbar('Verification failed', 'error');
    }
  };

  // UI helpers
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <School sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" className="app-title" sx={{ flexGrow: 1 }}>
            EduVerify
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setActiveTab('view')}
            className="nav-button"
            startIcon={<Verified />}
          >
            Certificates
          </Button>
          <Button 
            color="inherit" 
            onClick={() => setActiveTab('issue')}
            className="nav-button"
            startIcon={<CloudUpload />}
          >
            Issue
          </Button>
          <Button 
            color="inherit" 
            onClick={() => setActiveTab('verify')}
            className="nav-button"
            startIcon={<GppGood />}
          >
            Verify
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="main-container">
        {/* View Certificates Tab */}
        {activeTab === 'view' && (
          <Box>
            <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 700, color: 'var(--primary)' }}>
              Certificate Registry
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                label="Student Address"
                variant="outlined"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                className="input-field"
                InputProps={{ style: { fontSize: '1.1rem' } }}
              />
              <Button 
                variant="contained" 
                onClick={fetchCertificates}
                size="large"
                className="primary-button"
                endIcon={<AutoAwesome />}
              >
                Fetch
              </Button>
            </Box>

            {certificates.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
                {certificates.map((cert, index) => (
                  <Card key={index} className="card">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {cert.isRevoked ? (
                            <Revoked color="error" sx={{ fontSize: 32 }} />
                          ) : (
                            <Verified color="success" sx={{ fontSize: 32 }} />
                          )}
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Cert #{index + 1}
                          </Typography>
                        </Box>
                        <Chip
                          label={cert.isRevoked ? 'REVOKED' : 'VALID'}
                          className={cert.isRevoked ? 'revoked-chip' : 'valid-chip'}
                          size="medium"
                        />
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Student:</strong> {cert.issuedTo.substring(0, 6)}...{cert.issuedTo.substring(38)}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Institution:</strong> {cert.issuedBy.substring(0, 6)}...{cert.issuedBy.substring(38)}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          <strong>Issued:</strong> {new Date(cert.issuedAt * 1000).toLocaleDateString()}
                        </Typography>
                        
                        <Box sx={{ wordBreak: 'break-word', mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">IPFS Hash:</Typography>
                          <Typography variant="body2">{cert.ipfsHash}</Typography>
                        </Box>

                        {!cert.isRevoked && (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => {
                              setSelectedCert(cert);
                              setOpenDialog(true);
                            }}
                            startIcon={<Cancel />}
                            className="danger-button"
                          >
                            Revoke
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Verified sx={{ fontSize: 80, color: 'var(--primary)', mb: 2 }} />
                <Typography variant="h5" color="text.secondary">
                  {studentAddress ? 'No certificates found' : 'Enter a student address to view certificates'}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Issue Certificate Tab */}
        {activeTab === 'issue' && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 700, color: 'var(--primary)' }}>
              Issue New Certificate
            </Typography>
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Student Address"
                variant="outlined"
                value={issueStudent}
                onChange={(e) => setIssueStudent(e.target.value)}
                className="input-field"
                InputProps={{ style: { fontSize: '1.1rem' } }}
                sx={{ mb: 3 }}
              />
              
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="certificate-upload"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="certificate-upload">
                <Button
                  variant="contained"
                  component="span"
                  className="primary-button"
                  startIcon={<CloudUpload />}
                  sx={{ mr: 2 }}
                >
                  Upload PDF
                </Button>
              </label>
              {file && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography>{file.name}</Typography>
                </Box>
              )}
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleIssue}
              disabled={!file || !issueStudent}
              className="success-button"
              startIcon={<Verified />}
              sx={{ px: 4, py: 1.5 }}
            >
              Issue Certificate
            </Button>
          </Box>
        )}

        {/* Verify Certificate Tab */}
        {activeTab === 'verify' && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 700, color: 'var(--primary)' }}>
              Verify Certificate
            </Typography>
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Student Address"
                variant="outlined"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                className="input-field"
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Certificate Hash"
                variant="outlined"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                className="input-field"
              />
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleVerify}
              disabled={!studentAddress || !verifyHash}
              className="primary-button"
              startIcon={<GppGood />}
              sx={{ px: 4, py: 1.5 }}
            >
              Verify Certificate
            </Button>
            
            {verificationResult && (
              <Box className={`verification-result ${verificationResult === 'Valid' ? 'valid-chip' : 'revoked-chip'}`}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  Certificate Status: {verificationResult}
                </Typography>
                {verificationResult === 'Valid' ? (
                  <Verified sx={{ fontSize: 80, color: 'var(--success)' }} />
                ) : (
                  <Cancel sx={{ fontSize: 80, color: 'var(--danger)' }} />
                )}
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Confirm Revocation
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to revoke this certificate?
          </Typography>
          {selectedCert && (
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Student:</strong> {selectedCert.issuedTo.substring(0, 12)}...{selectedCert.issuedTo.substring(34)}
              </Typography>
              <Typography variant="body2">
                <strong>IPFS Hash:</strong> {selectedCert.ipfsHash.substring(0, 16)}...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'var(--dark)' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleRevoke} 
            variant="contained"
            className="danger-button"
          >
            Confirm Revoke
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%', fontSize: '1rem' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;