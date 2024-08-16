import jwt from 'jsonwebtoken'
import User from "../models/brugerModel.js"

const requireAuth = async (req, res, next) => {

    // verify authentication
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({error: 'Autorisering-token påkrævet.'})
    }

    const token = authorization.split(' ')[1]

    try {
        const { _id } = jwt.verify(token, process.env.SECRET)

        req.user = await User.findOne({_id}).select('_id')
        next()

    } catch (error) {
        console.log(error)
        res.status(401).json({error: 'Anmodning er ikke autoriseret.'})
    }

}

export default requireAuth