/**
 * 用于prompt的常用验证
 */
import fs from 'node:fs'
import npmName from 'npm-name';

const validateNpmName = (errMsg?: string) => {
    return async (value: string) => {
        try {
            const res = await npmName(value);
            return !!res ? true : errMsg || 'Please enter a valid npm package name.';
        } catch (error) {
            return errMsg || (error as Error).message || 'Please enter a valid npm package name.';
        }
    }
}

const validateFilePath = (path: string, errMsg?: string) => {
    const exists = fs.existsSync(path);

    if (!exists) return errMsg || 'Please enter a valid file path.';
    return true;
}

const validateEmail = (value: string, errMsg?: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!valid) return errMsg || 'Please enter a valid email.';
    return true;
}

const validateUrl = (value: string, errMsg?: string) => {
    const valid = /^(https?:\/\/)?[^\s/$.?#].[^\s]*$/.test(value);
    if (!valid) return errMsg || 'Please enter a valid URL.';
    return true;
}

export {
    validateNpmName,
    validateFilePath,
    validateEmail,
    validateUrl
}
