
class UserControllers {
    static async get(req, res){
        try{
            const users = await "";
            res.json(users);
        }catch(e){
            res.json({
                err: "Terjadi kesalahan"
            })
        }
    }

    static async getById(req, res){
        try{
            const user = await "";

            if(!user){
                return res.json({
                    err: "User tidak ditemukan"
                })
            }

            return res.json(user);
        }catch(e){
            res.json({
                err: "Terjadi kesalahan"
            })
        }
    }
}

export default UserControllers;