export const generateOTP = async () => {
    const number = Math.floor(Math.random() * 10000); // Generates a number between 0 and 9999
    return number.toString().padStart(4, '0'); // Pads the number to ensure it is 4 digits
};