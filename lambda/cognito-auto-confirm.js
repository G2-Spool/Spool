exports.handler = async (event) => {
    console.log('Auto-confirm Lambda triggered:', JSON.stringify(event, null, 2));
    
    // Auto-confirm the user
    event.response.autoConfirmUser = true;
    
    // Set email as verified if it exists
    if (event.request.userAttributes.email) {
        event.response.autoVerifyEmail = true;
    }
    
    // Set phone as verified if it exists  
    if (event.request.userAttributes.phone_number) {
        event.response.autoVerifyPhone = true;
    }
    
    console.log('User auto-confirmed:', event.userName);
    console.log('Email:', event.request.userAttributes.email);
    
    return event;
}; 