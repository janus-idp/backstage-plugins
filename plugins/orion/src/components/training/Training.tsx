import React from "react";
import {PageHeader} from "../PageHeader";
import {Content, ContentHeader, Page, SupportButton, Tabs} from "@backstage/core-components";
import {Typography} from "@material-ui/core";
import {TrainingCard} from "./TrainingCard";
import {mockRecentTraining} from "./mock/mockTraining";
import {TrainingHistory} from "./TrainingHistory";

export const Training = () => {

    return (
        <Page themeId="tool">
            <PageHeader/>
            <Content>
                <ContentHeader title="Training">
                    <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
                </ContentHeader>
                <Typography paragraph>
                    Performance-based training recommendations
                </Typography>
                <Tabs
                    tabs={[{
                        label: `RECENT`,
                        content: <TrainingCard training={mockRecentTraining}/>,
                    }, {
                        label: `HISTORY`,
                        content: <TrainingHistory/>,
                    }]}
                />
            </Content>
        </Page>
    );

}