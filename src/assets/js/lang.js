window.lang = {
    dictionary: "<!--DICTIONARY_CONTENT-->",

    get: function(key){
        if(this.dictionary[key] !== undefined) {
            return this.dictionary[key]
        }else{
            console.error(`Translation not found: ${key}`)
            return `{${key}}`;
        }
    }
}