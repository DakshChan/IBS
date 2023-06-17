import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import AdminApi from '../../../api/admin_api';
import { toast } from 'react-toastify';
import { Box, Button, Card, Input, TextField, Typography } from '@mui/material';
import NavBar from '../../Module/Navigation/NavBar';
import { Link, useParams } from 'react-router-dom';
import AdminCourseCRUD from '../../General/AdminCourseCRUD/AdminCourseCRUD';
import Grid from '@mui/material/Unstable_Grid2';

const AdminCoursePage = () => {
    const { register: register4, handleSubmit: handleSubmit4, control: control4 } = useForm();
    const { register: register5, handleSubmit: handleSubmit5, control: control5 } = useForm();
    const { register: register6, handleSubmit: handleSubmit6, control: control6 } = useForm();
    let { course_id } = useParams();
    const changeCourse = (data) => {
        AdminApi.change_course({ ...data, course_id: course_id }).then((response) => {
            console.log(response);
            toast(response.data.message);
        });
    };
    const addRole = (data) => {
        AdminApi.add_role({ ...data, course_id: course_id }).then((response) => {
            console.log(response);
            toast(response.data.message);
        });
    };

    const uploadRole = (data) => {
        AdminApi.add_role({ ...data, course_id: course_id }).then((response) => {
            console.log(response);
            toast(response.data.message);
        });
    };

    const deleteRole = (data) => {
        AdminApi.delete_role({ ...data, course_id: course_id }).then((response) => {
            console.log(response);
            toast(response.data.message);
        });
    };

    const OldComponent = () => {
        return (
            <Grid container direction="column" height="100%" wrap="nowrap">
                <NavBar item page="Task" role={'admin'} />
                <Grid
                    item
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="center"
                    alignContent="center"
                    justify="center"
                    flex="1 1 auto"
                >
                    <Grid item>
                        <Card>
                            <Box
                                sx={{
                                    margin: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                                maxWidth={300}
                            >
                                <Typography component="h1" variant="h5">
                                    Add role
                                </Typography>
                                {/*<Box component="form"*/}
                                {/*     onSubmit={handleSubmit4(addRole)}*/}
                                {/*     noValidate*/}
                                {/*     sx={{mt: 1}}>*/}
                                <form onSubmit={handleSubmit4(addRole)}>
                                    {/*<Controller*/}
                                    {/*  render={({*/}
                                    {/*             field: {onChange, onBlur, value, name, ref},*/}
                                    {/*             fieldState: {invalid, isTouched, isDirty, error},*/}
                                    {/*           }) => (*/}
                                    {/*    <TextField margin="normal"*/}
                                    {/*               required*/}
                                    {/*               fullWidth*/}
                                    {/*               label="Course ID"*/}
                                    {/*               autoFocus*/}
                                    {/*               value={value}*/}
                                    {/*               onChange={onChange}*/}
                                    {/*               onBlur={onBlur}*/}
                                    {/*               inputRef={ref}*/}
                                    {/*    />*/}
                                    {/*  )}*/}
                                    {/*  name={"course_id"}*/}
                                    {/*  control={control4}*/}
                                    {/*  rules={{required: true}}*/}
                                    {/*/>*/}
                                    <Controller
                                        render={({
                                            field: { onChange, onBlur, value, name, ref },
                                            fieldState: { invalid, isTouched, isDirty, error }
                                        }) => (
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                label="Username"
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                inputRef={ref}
                                            />
                                        )}
                                        name={'username'}
                                        control={control4}
                                        rules={{ required: true }}
                                    />
                                    <Controller
                                        render={({
                                            field: { onChange, onBlur, value, name, ref },
                                            fieldState: { invalid, isTouched, isDirty, error }
                                        }) => (
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                label="Role"
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                inputRef={ref}
                                            />
                                        )}
                                        name={'role'}
                                        control={control4}
                                        rules={{ required: true }}
                                    />
                                    <Controller
                                        render={({
                                            field: { onChange, onBlur, value, name, ref },
                                            fieldState: { invalid, isTouched, isDirty, error }
                                        }) => (
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                label="Email"
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                inputRef={ref}
                                            />
                                        )}
                                        name={'email'}
                                        control={control4}
                                        rules={{ required: true }}
                                    />

                                    <Controller
                                        render={({
                                            field: { onChange, onBlur, value, name, ref },
                                            fieldState: { invalid, isTouched, isDirty, error }
                                        }) => (
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                label="Update user info"
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                inputRef={ref}
                                            />
                                        )}
                                        name={'update_user_info'}
                                        control={control4}
                                        rules={{ required: true }}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Submit
                                    </Button>
                                </form>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card>
                            <Box
                                sx={{
                                    margin: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                                maxWidth={300}
                            >
                                <Typography component="h1" variant="h5">
                                    Upload roles
                                </Typography>
                                <Box
                                    component="form"
                                    onSubmit={handleSubmit5(uploadRole)}
                                    noValidate
                                    sx={{ mt: 1 }}
                                >
                                    {/*<Controller*/}
                                    {/*  render={({*/}
                                    {/*             field: {onChange, onBlur, value, name, ref},*/}
                                    {/*             fieldState: {invalid, isTouched, isDirty, error},*/}
                                    {/*           }) => (*/}
                                    {/*    <TextField margin="normal"*/}
                                    {/*               required*/}
                                    {/*               fullWidth*/}
                                    {/*               label="Course ID"*/}
                                    {/*               autoFocus*/}
                                    {/*               value={value}*/}
                                    {/*               onChange={onChange}*/}
                                    {/*               onBlur={onBlur}*/}
                                    {/*               inputRef={ref}*/}
                                    {/*    />*/}
                                    {/*  )}*/}
                                    {/*  name={"course_id"}*/}
                                    {/*  control={control5}*/}
                                    {/*  rules={{required: true}}*/}
                                    {/*/>*/}
                                    <Button variant="contained" component="label">
                                        Upload File
                                        <input
                                            hidden
                                            multiple={true}
                                            type="file"
                                            {...register5('file')}
                                        />
                                    </Button>
                                    <Controller
                                        render={({
                                            field: { onChange, onBlur, value, name, ref },
                                            fieldState: { invalid, isTouched, isDirty, error }
                                        }) => (
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                label="Role"
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                inputRef={ref}
                                            />
                                        )}
                                        name={'role'}
                                        control={control5}
                                        rules={{ required: true }}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card>
                            <Box
                                sx={{
                                    margin: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                                maxWidth={300}
                            >
                                <Typography component="h1" variant="h5">
                                    Delete role
                                </Typography>
                                <Box
                                    component="form"
                                    onSubmit={handleSubmit6(deleteRole)}
                                    noValidate
                                    sx={{ mt: 1 }}
                                >
                                    {/*<Controller*/}
                                    {/*  render={({*/}
                                    {/*             field: {onChange, onBlur, value, name, ref},*/}
                                    {/*             fieldState: {invalid, isTouched, isDirty, error},*/}
                                    {/*           }) => (*/}
                                    {/*    <TextField margin="normal"*/}
                                    {/*               required*/}
                                    {/*               fullWidth*/}
                                    {/*               label="Course ID"*/}
                                    {/*               autoFocus*/}
                                    {/*               value={value}*/}
                                    {/*               onChange={onChange}*/}
                                    {/*               onBlur={onBlur}*/}
                                    {/*               inputRef={ref}*/}
                                    {/*    />*/}
                                    {/*  )}*/}
                                    {/*  name={"course_id"}*/}
                                    {/*  control={control6}*/}
                                    {/*  rules={{required: true}}*/}
                                    {/*/>*/}
                                    <Controller
                                        render={({
                                            field: { onChange, onBlur, value, name, ref },
                                            fieldState: { invalid, isTouched, isDirty, error }
                                        }) => (
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                label="Username"
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                inputRef={ref}
                                            />
                                        )}
                                        name={'username'}
                                        control={control6}
                                        rules={{ required: true }}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        );
    };

    return (
        <Grid container>
            <Grid xs={12}>
                <NavBar page="Course" role="admin" />
            </Grid>
            <Grid xs={12} sx={{ mt: 3 }}>
                <Grid container justifyContent="center" direction="column" alignItems="center">
                    <Grid xs={12}>
                        <AdminCourseCRUD />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default AdminCoursePage;