import crypto from 'crypto';
import {
    parsePhoneNumberFromString,
    isValidPhoneNumber,
    type CountryCode
} from 'libphonenumber-js';
// import { sendSingleSMSAction } from '@/actions/smsglobal';
// import { SMSMessage } from '@/types/smsglobal';

// const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

export const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

export const validatePhoneNumber = (phone: string) => {
    try {
        let phoneNumber = parsePhoneNumberFromString(phone);

        if (phoneNumber && isValidPhoneNumber(phone)) {
            return {
                isValid: true,
                formatted: phoneNumber.formatInternational(),
                original: phone
            };
        }

        const commonCountries: CountryCode[] = [
            'AU',
            'US',
            'GB',
            'CA',
            'NZ',
            'DE',
            'FR',
            'IT',
            'ES',
            'JP',
            'IN',
            'BR',
            'MX'
        ];

        for (const countryCode of commonCountries) {
            try {
                phoneNumber = parsePhoneNumberFromString(phone, countryCode);
                if (phoneNumber && phoneNumber.isValid()) {
                    return {
                        isValid: true,
                        formatted: phoneNumber.formatInternational(),
                        original: phone
                    };
                }
            } catch {
                // Continue to next country
                continue;
            }
        }

        return { isValid: false, formatted: phone, original: phone };
    } catch (error) {
        return {
            isValid: false,
            formatted: phone,
            original: phone
        };
    }
};

// export const sendSMSOTP = async (phoneNumber: string, otp: string) => {
//     console.log(`Sending SMS OTP to ${phoneNumber}: ${otp}`);

//     const smsMessage: SMSMessage = {
//         destination: phoneNumber,
//         message: `Your verification code for Buxmate is: ${otp}. This code will expire in 10 minutes.`
//     };

//     // const response = await sendSingleSMSAction(smsMessage);

//     // if (!response.messages) {
//     //     return {
//     //         success: false,
//     //         message: 'Failed to send verification message'
//     //     };
//     // }

//     return {
//         success: true,
//         message: 'Phone number updated successfully!',
//         data: {
//             phoneNumber
//         }
//     };
// };
