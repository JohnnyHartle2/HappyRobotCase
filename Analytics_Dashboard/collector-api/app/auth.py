from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

security = HTTPBearer(auto_error=False)

def get_api_key(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate API key from either Authorization header or x-api-key header"""
    
    # Try to get API key from Authorization header first
    if credentials:
        api_key = credentials.credentials
    else:
        # Fall back to x-api-key header
        api_key = request.headers.get("x-api-key")
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required in Authorization header or x-api-key header"
        )
    
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

def require_ingest_key(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Require ingest API key for webhook endpoints"""
    
    # Try to get API key from Authorization header first
    if credentials:
        api_key = credentials.credentials
    else:
        # Fall back to x-api-key header
        api_key = request.headers.get("x-api-key")
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required in Authorization header or x-api-key header"
        )
    
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

def require_read_key(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Require read API key for analytics endpoints"""
    
    # Try to get API key from Authorization header first
    if credentials:
        api_key = credentials.credentials
    else:
        # Fall back to x-api-key header
        api_key = request.headers.get("x-api-key")
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required in Authorization header or x-api-key header"
        )
    
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
