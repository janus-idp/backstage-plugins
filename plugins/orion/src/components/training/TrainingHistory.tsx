import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    Grid,
    TablePagination,
    Typography,
    withStyles
} from "@material-ui/core";
import {Select, SelectedItems, SelectItem} from "@backstage/core-components";
import React, {useEffect, useState} from "react";
import {Training} from "./type/Training";
import {mockTrainings} from "./mock/mockTraining";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {TrainingCard} from "./TrainingCard";
import {grey} from "@material-ui/core/colors";


export const TrainingHistory = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [projectFilterItems, setProjectFilterItems] = useState<SelectItem[]>([]);
    const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const onFilterProjects = (arg: SelectedItems) => {
        setFilteredTrainings(arg === "All Courses" ? trainings : trainings.filter(training => training.course.title === arg))
    }

    useEffect(() => {
        setTrainings(mockTrainings);
        setFilteredTrainings(mockTrainings);
        setProjectFilterItems([]);
    }, []);

    const ParodosAccordion = withStyles({
        root: {
            border: "1px solid",
            borderLeftWidth: "0",
            borderRightWidth: "0",
            borderColor: grey.A100,
            background: "transparent",
            boxShadow: 'none',
            "&:not(:last-child)": {
                borderBottom: 1,
            },
            "&:before": {
                display: "none",
            },
            "&$expanded": {
                margin: "auto",
            },
        },
        expanded: {}
    })(Accordion);

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item xs={3}>
                <Select
                    onChange={onFilterProjects}
                    placeholder="All Courses"
                    label="Filter by"
                    items={projectFilterItems}
                />
            </Grid>
            <Grid item>
                {
                    filteredTrainings.map((training) => (
                        <ParodosAccordion square>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                aria-controls="panel1bh-content"
                                id="panel1bh-header"
                            >
                                <Grid container direction="row" alignItems="center" spacing={2}>
                                    <Grid item xs={1}>
                                        <Checkbox
                                            color="primary"
                                            // checked={notificationIsSelected}
                                            // onClick={() =>
                                            //     NotificationListItemUtils.handleSelectNotification({
                                            //         notificationIsSelected,
                                            //         notificationsContext,
                                            //         notification,
                                            //     })
                                            // }
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">{training.course.title}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="body2">{training.date}</Typography>
                                    </Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TrainingCard training={training}/>
                            </AccordionDetails>
                        </ParodosAccordion>
                    ))
                }
            </Grid>
            <Grid container direction="row" justifyContent="center">
                <TablePagination
                    component="div"
                    count={filteredTrainings.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[5, 10, 20]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Grid>
        </Grid>
    );
}