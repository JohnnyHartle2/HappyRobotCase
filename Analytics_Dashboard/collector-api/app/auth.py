from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

security = HTTPBearer()

def get_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate API key from Authorization header"""
    api_key = credentials.credentials
    
    # Get valid API keys from environment
    ingest_key = os.getenv("INGEST_API_KEY")
    read_key = os.getenv("READ_API_KEY")
    
    valid_keys = [k for k in [ingest_key, read_key] if k]
    
    if not valid_keys:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API keys not configured"
        )
    
    if api_key not in valid_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return api_key

def require_ingest_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Require ingest API key for webhook endpoints"""
    api_key = credentials.credentials
    ingest_key = os.getenv("INGEST_API_KEY")
    
    if not ingest_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ingest API key not configured"
        )
    
    if api_key != ingest_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid ingest API key"
        )
    
    return api_key

def require_read_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Require read API key for analytics endpoints"""
    api_key = credentials.credentials
    read_key = os.getenv("READ_API_KEY")
    
    if not read_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Read API key not configured"
        )
    
    if api_key != read_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid read API key"
        )
    
    return api_key
