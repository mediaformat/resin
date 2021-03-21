import React, { useState, useEffect } from "react";
import {
    View,
    Dimensions,
    Image,
    Text,
    TouchableWithoutFeedback
} from "react-native";

import * as Linking from "expo-linking";

import { activeOrNot } from "src/interface/interactions"

import GridViewJsx from "src/components/posts/grid-view";
import {
    ScreenWithTrayJsx,
    ScreenWithFullNavigationJsx
} from "src/components/navigation/navigators";

import ModerateMenuJsx from "src/components/moderate-menu.js";

const TEST_IMAGE = "https://cache.desktopnexus.com/thumbseg/2255/2255124-bigthumbnail.jpg";
const TEST_POSTS = [
    {
        id: 1,
        media_attachments: [
            {preview_url: TEST_IMAGE}
        ]
    },
    {
        id: 2,
        media_attachments: [
            {preview_url: TEST_IMAGE}
        ]
    },
    {
        id: 3,
        media_attachments: [
            {preview_url: TEST_IMAGE}
        ]
    },
    {
        id: 4,
        media_attachments: [
            {preview_url: TEST_IMAGE}
        ]
    }
];

const TEST_PROFILE = {
    username: "njms",
    acct: "njms",
    display_name: "Nat🔆",
    locked: false,
    bot: false,
    note: "Yeah heart emoji.",
    avatar: TEST_IMAGE,
    followers_count: "1 jillion",
    statuses_count: 334,
    fields: [
        {
            name: "Blog",
            value: "<a href=\"https://njms.ca\">https://njms.ca</a>",
            verified_at: "some time"
        },
        {
            name: "Github",
            value: "<a href=\"https://github.com/natjms\">https://github.com/natjms</a>",
            verified_at: null
        }
    ]
};

const TEST_YOUR_FOLLOWERS = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
];

const TEST_THEIR_FOLLOWERS = [
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 6 },
];

function withoutHTML(string) {
    return string.replaceAll(/<[^>]*>/ig, "");
}

function getMutuals(yours, theirs) {
    // Where yours and theirs are arrays of followers, as returned by the oAPI

    const idify = ({id}) => id;
    const asIDs = new Set(theirs.map(idify));

    return yours.filter(x => asIDs.has(idify(x)));
}

const HTMLLink = ({link}) => {
    let url = link.match(/https?:\/\/\w+\.\w+/);

    if (url) {
        return (
            <Text
                style = { styles.anchor }
                onPress = {
                    () => {
                        Linking.openURL(url[0]);
                    }
            }>
                { withoutHTML(link) }
            </Text>
        );
    } else {
        return (<Text> { withoutHTML(link) } </Text>);
    }
}

const ProfileJsx = ({navigation}) => {
    return (
        <ScreenWithTrayJsx
             active = "Profile"
             navigation = { navigation }
             active = "Profile">
            <ProfileDisplayJsx navigation = { navigation }/>
        </ScreenWithTrayJsx>
    );
};

const ViewProfileJsx = ({navigation}) => {
    return (
        <ScreenWithFullNavigationJsx
            active = { navigation.getParam("originTab") }
            navigation = { navigation }>
            <ProfileDisplayJsx navigation = { navigation } />
        </ScreenWithFullNavigationJsx>
    );
}

const ProfileDisplayJsx = ({navigation}) => {
    const accountName = navigation.getParam("acct", "");
    let [state, setState] = useState({
        loaded: false,
        own: false
    });

    const notif_pack = {
        active: require("assets/eva-icons/bell-unread.png"),
        inactive: require("assets/eva-icons/bell-black.png")
    }

    useEffect(() => {
        // do something to get the profile based on given account name
        setState({
            profile: TEST_PROFILE,
            mutuals: getMutuals(TEST_YOUR_FOLLOWERS, TEST_THEIR_FOLLOWERS),
            loaded: true
        });
    }, []);

    let profileButton;
    if (state.own) {
        profileButton = (
            <TouchableWithoutFeedback>
                <View style = { styles.button }>
                    <Text style = { styles.buttonText }>Edit profile</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    } else {
        profileButton = (
            <TouchableWithoutFeedback>
                <View style = { styles.button }>
                    <Text style = { styles.buttonText }>Follow</Text>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    return (
        <View>
            { state.loaded ?
                <>
                    <View style = { styles.jumbotron }>
                        <View style = { styles.profileHeader }>
                            <Image
                                source = { { uri: state.profile.avatar } }
                                style = { styles.avatar } />
                            <View>
                                <Text
                                    style = { styles.displayName }>
                                    {state.profile.display_name}
                                </Text>
                                <Text style={ styles.strong }>
                                    @{state.profile.username }
                                </Text>
                            </View>
                            {
                                state.own ?
                                    <TouchableWithoutFeedback>
                                        <Image
                                            source = { activeOrNot(state.unread_notifs, notif_pack) }
                                            style = {
                                                [
                                                    styles.profileHeaderIcon,
                                                    styles.profileContextConatiner
                                                ]
                                            } />
                                    </TouchableWithoutFeedback>
                                : <ModerateMenuJsx
                                    triggerStyle = { styles.profileHeaderIcon }
                                    containerStyle = { styles.profileContextContainer } />
                            }
                        </View>
                        <Text style = { styles.accountStats }>
                            { state.profile.statuses_count } posts &#8226;&nbsp;
                            { state.mutuals.length } mutuals
                        </Text>
                        <Text style = { styles.note }>
                            {state.profile.note}
                        </Text>
                        <table style = { styles.metaData }>
                            {
                                state.profile.fields.map((row, i) =>
                                    <tr
                                          key = { i }
                                          style = { styles.row }>
                                        <td style = { styles.rowName } >
                                            <Text>{ row.name }</Text>
                                        </td>
                                        <td style = { styles.rowValue }>
                                            <Text>
                                                <HTMLLink
                                                    link = { row.value } />
                                            </Text>
                                        </td>
                                    </tr>
                                )
                            }
                        </table>
                        {profileButton}
                    </View>

                    <GridViewJsx
                        posts = { TEST_POSTS }
                        openPostCallback = {
                            (id) => {
                                navigation.navigate("ViewPost", {
                                    id: id,
                                    originTab: "Profile"
                                });
                            }
                        } />
                </>
            : <View></View>
            }
        </View>
    );
};

const screen_width = Dimensions.get("screen").width;
const screen_height = Dimensions.get("screen").height;

const styles = {
    jumbotron: {
        padding: screen_width / 20,
    },
    profileHeader: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: screen_width / 20
    },
    displayName: {
        fontSize: 24
    },
    avatar: {
        width: screen_width / 5,
        height: screen_width / 5,

        borderRadius: "100%",
        marginRight: screen_width / 20
    },
    profileHeaderIcon: {
        width: screen_width / 12,
        height: screen_width / 12,
    },
    profileContextContainer: {
        marginLeft: "auto",
        marginRight: screen_width / 15
    },
    accountStats: {
        fontSize: 14,
        fontWeight: "bold"
    },
    note: {
        fontSize: 16,
        marginTop: 10,
    },

    metaData: {
        marginTop: 20
    },
    row: {
        padding: 10
    },
    rowName: {
        width: "33%",
        textAlign: "center"
    },
    rowValue: { width: "67%" },
    anchor: {
        color: "#888",
        textDecoration: "underline"
    },

    button: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#888",
        borderRadius: 5,

        padding: 10,
        marginTop: 10
    },
    buttonText: {
        textAlign: "center"
    },
    strong: {
        fontWeight: "bold",
    },
};

export { ViewProfileJsx, ProfileDisplayJsx };
export default ProfileJsx;
