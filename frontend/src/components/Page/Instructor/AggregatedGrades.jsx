import AggregatedGradesTable from '../../General/AggregatedGradesTable/AggregatedGradesTable';
import Grid from '@mui/material/Unstable_Grid2';
import NavBar from '../../Module/Navigation/NavBar';
import FlexyTabs from '../../General/FlexyTabs/FlexyTabs';
import { Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import InstructorApi from '../../../api/instructor_api';
import { useEffect } from 'react';

const rows = [
    {
        id: '1',
        student: 'Sunil Joshi',
        grade: '28'
    },
    {
        id: '2',
        student: 'Andrew McDownland',
        grade: '90'
    },
    {
        id: '3',
        student: 'Christopher Jamil',
        grade: '74'
    },
    {
        id: '4',
        student: 'Nirav Joshi',
        grade: '92'
    },
    {
        id: '5',
        student: 'Micheal Doe',
        grade: '67'
    }
];

const headCells = [
    {
        id: 'student',
        numeric: false,
        disablePadding: false,
        label: 'Students'
    },
    {
        id: 'grade',
        numeric: false,
        disablePadding: false,
        label: 'Grades'
    }
];

const flexyTabs = [
    {
        tabName: 'Tab 1',
        tabId: 0,
        tabSubheading: 'Example of Subheading 1',
        tabContext: (
            <Typography
                color="textSecondary"
                sx={{
                    mt: 4
                }}
            >
                Example of description 1
            </Typography>
        )
    },
    {
        tabName: 'Tab 2',
        tabId: 1,
        tabSubheading: 'Example of Subheading 2',
        tabContext: (
            <Typography
                color="textSecondary"
                sx={{
                    mt: 4
                }}
            >
                Example of description 2
            </Typography>
        )
    },
    {
        tabName: 'Aggregated Grades',
        tabId: 2,
        tabSubheading: 'Aggregated Grades',
        tabContext: <AggregatedGradesTable rows={rows} headCells={headCells} />
    }
];

const AggregatedGrades = (props) => {
    const navigate = useNavigate();

    const { courseId } = useParams();

    useEffect(() => {
        InstructorApi.getAllMarks(courseId).then((res) => {});
    }, [courseId, navigate]);

    return (
        <Grid container spacing={2}>
            <Grid xs={12}>
                <NavBar />
            </Grid>
            <Grid xs={12}>
                {/*TODO: Handle case where no marks have been uploaded*/}
                <FlexyTabs tabs={flexyTabs} />
            </Grid>
        </Grid>
    );
};

export default AggregatedGrades;
