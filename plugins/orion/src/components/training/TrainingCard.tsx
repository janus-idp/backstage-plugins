import {
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    Typography
} from "@material-ui/core";
import React from "react";
import {Training} from "./type/Training";
import LaunchIcon from '@material-ui/icons/Launch';
import {ItemCardHeader, LinkButton} from "@backstage/core-components";

type Props = {
    training: Training;
}

const fields = {
    date: "Date",
    project: "Project",
    event: "Event Name",
    trigger: "Assignment Trigger",
    initialEventPoints: "Initial Event Points",
    course: "Course Recommendation",
    progress: "Progress",
}

export const TrainingCard = ({training}: Props) => {
    return (
        <Grid container direction="row" justifyContent="flex-start" spacing={2}>
            <Grid item xs={6}>
                <List dense>
                    {
                        Object.keys(fields).map((key) => (
                            <ListItem key={key}>
                                <Typography variant="body2" style={{whiteSpace: 'normal'}}>
                                    {key === 'course' ?
                                        `${fields.course} - ${training.course.title}` :
                                        `${fields[key as keyof Training]} - ${training[key as keyof Training]}`
                                    }
                                </Typography>

                                {key === 'course' ?
                                    (<ListItemIcon>
                                        <LaunchIcon style={{width: 15, height: 15}}/>
                                    </ListItemIcon>) : (<></>)
                                }
                            </ListItem>
                        ))
                    }
                </List>
            </Grid>
            <Grid item>
                <Card style={{maxWidth: 500}}>
                    <CardMedia>
                        <ItemCardHeader title={training.course.title} subtitle="Course Recommendation"/>
                    </CardMedia>
                    <CardContent>
                        {training.course.description}
                    </CardContent>
                    <CardActions>
                        <LinkButton color="primary" to={training.course.url}>
                            Go There!
                        </LinkButton>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>);
}