import {View} from "react-native";
import '../global.css'
import LottieView from "lottie-react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function StartPage() {

    return (
        <SafeAreaProvider>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <LottieView style={{height: 100, width: 100}} source={require('../assets/animation/loading2.json')} autoPlay
                            loop/>
            </View>
        </SafeAreaProvider>
    );
}
