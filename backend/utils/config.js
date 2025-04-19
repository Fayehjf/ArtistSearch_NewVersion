const cookieOptions = {
    httpOnly: true,      
    secure: process.env.NODE_ENV === 'production',  
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3600000, 
};
  

module.exports = {cookieOptions};