
// iss controller ka kaam hai currently logged in user ki inforrmation frontend ko return karna jab /api/me waali request hit huyi
// it needs to have protect middleware so that the user is authenticated

/*
    Frontend
       ↓
    GET /api/me
       ↓
    Gateway
       ↓
    protect
       ↓
    getCurrentUser
       ↓
    Response → Frontend
*/
export const getCurrentUser = async (req,res) => {
    try{
        return res.status(200).json({
            success : true,
            user : req.user // req.user aaya protect middleware se
        });
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}
