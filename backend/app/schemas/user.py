from pydantic import BaseModel, ConfigDict, EmailStr


class RegisterIn(BaseModel):
    email: EmailStr
    login: str
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    login: str
    email: EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class ForgotPasswordIn(BaseModel):
    email: EmailStr
