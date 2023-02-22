import {Training} from "../type/Training";

export const mockTrainings: Training[] = [
    {
        date: 'Feb 1, 2023',
        project: 'Project -  org/repo-name',
        event: 'Event Name - Test coverage',
        trigger: 'Assignment Trigger - Test coverage below 50%',
        initialEventPoints: 'Initial Event Point - 34%',
        course: {
            title: 'Course Recommendation - 10 Easy Steps to Improve Your Test Coverage',
            creator: 'JohnDoe',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            url: 'http://www.redhat.com'
        },
        progress: 'Progress - Completed',
    },
    {
        date: 'Feb 1, 2023',
        project: 'Project -  org/repo-name',
        event: 'Event Name - Test coverage',
        trigger: 'Assignment Trigger - Test coverage below 50%',
        initialEventPoints: 'Initial Event Point - 34%',
        course: {
            title: 'Course Recommendation - 10 Easy Steps to Improve Your Test Coverage',
            creator: 'JohnDoe',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            url: 'http://www.redhat.com'
        },
        progress: 'Progress - Completed',
    },
    {
        date: 'Feb 1, 2023',
        project: 'Project -  org/repo-name',
        event: 'Event Name - Test coverage',
        trigger: 'Assignment Trigger - Test coverage below 50%',
        initialEventPoints: 'Initial Event Point - 34%',
        course: {
            title: 'Course Recommendation - 10 Easy Steps to Improve Your Test Coverage',
            creator: 'JohnDoe',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            url: 'http://www.redhat.com'
        },
        progress: 'Progress - Completed',
    }
];

export const mockRecentTraining: Training =
    {
        date: 'Feb 1, 2023',
        project: 'org/repo-name',
        event: 'Test coverage',
        trigger: 'Test coverage below 50%',
        initialEventPoints: '34%',
        course: {
            title: '10 Easy Steps to Improve Your Test Coverage',
            creator: 'JohnDoe',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            url: 'http://www.redhat.com'
        },
        progress: 'Completed',
    };
