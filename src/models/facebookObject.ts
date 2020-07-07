import { prop, getModelForClass } from '@typegoose/typegoose'

export interface Name {
    familyName: string;
    givenName: string;
}

export class FacebookObject {
    @prop()
    public id: string;

    @prop()
    public emails: {
        type: {
            value: string
        }[]
    };

    @prop()
    public name: Name;

    @prop()
    public facebookId: string;
}

export const FacebookModel = getModelForClass(FacebookObject)
