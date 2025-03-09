import Header from '../components/Header';
import {Stack} from "expo-router";

export default function AppLayout() {
    return (
        <Stack
            screenOptions={{
                header: () => <Header title={"talkie"}/>,
                headerShadowVisible: false,
            }}
        >
        </Stack>
    );
}