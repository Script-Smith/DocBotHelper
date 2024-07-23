export function getToken(user, statuscode, res) {
    const token = user.getWebToken();
    const options = {
        expires: new Date(
            Date.now() + parseInt(process.env.JWT_EX_TIME) * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure:true,
    };

    res.status(statuscode).cookie("token", token, options).json({
        success: true,
        id: user._id,
        token,
    });
}
