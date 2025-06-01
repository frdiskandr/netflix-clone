class JsonConverter {
    static StrToJson(x){
        try{
            return JSON.parse(x);
        }catch(e){
            return null
        }
    }

    static JsonToStr(x){
        try{
            return JSON.stringify(x);
        }catch(e){
            return null
        }
    }
}