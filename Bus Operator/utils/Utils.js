export const convertToPascal = (str) => {

    if (str === null || typeof (null) === undefined) {
        return str;
    }
    else {
        // Split the string into an array of words
        let words = str.split(' ');

        // Capitalize the first letter of each word
        for (let i = 0; i < words.length; i++) {
            // Capitalize the first letter of each word
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
        }

        // Join the words back into a single string
        return words.join(' ');
    }
}

export const getCurrentDateTimeInMillis = () => {
    return new Date().getTime();
}