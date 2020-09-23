import * as React from 'react';
import '../styles/ui.css';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    main: {
        margin: theme.spacing(3),
    },
});

const App = ({classes}) => {
    const onCreate = React.useCallback(() => {
        parent.postMessage({pluginMessage: {type: 'create-cursors'}}, '*');
    }, []);

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = event => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'create-cursors') {
                console.log(`Figma Says: ${message}`);
            }
        };
    }, []);

    return (
        <div className={classes.main}>
            <Button id="create" variant="contained" color="primary" onClick={onCreate}>
                Create
            </Button>
        </div>
    );
};

export default withStyles(styles)(App);
