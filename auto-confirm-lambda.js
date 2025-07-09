exports.handler = async (event) => {
    // Auto-confirm the user
    event.response.autoConfirmUser = true;
    
    // Set email as verified
    if (event.request.userAttributes.hasOwnProperty('email')) {
        event.response.autoVerifyEmail = true;
    }
    
    // Set phone as verified (if applicable)
    if (event.request.userAttributes.hasOwnProperty('phone_number')) {
        event.response.autoVerifyPhone = true;
    }
    
    console.log('Auto-confirmed user:', event.request.userAttributes.email || event.userName);
    
    return event;
};
