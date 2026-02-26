import { FeedbackSchema, FileSchema, MemberSchema, ProjectSchema, UserSchema } from '../../models/schema';
import { generateInterfaces } from '../schema-to-ts';

generateInterfaces(
    {
        User: UserSchema,
        Project: ProjectSchema,
        Member: MemberSchema,
        File: FileSchema,
        Feedback: FeedbackSchema,
    },
    "./src/models/models.d.ts"
);