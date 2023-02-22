import {Course} from "./Course";

export type Training = {
    date: string;
    project: string;
    event: string;
    trigger: string;
    initialEventPoints: string;
    course: Course;
    progress: string;
}