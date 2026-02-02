package com.restohub.app;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class FirebaseMessagingService extends com.capacitorjs.plugins.pushnotifications.PushMessagingService {
    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        // Handle foreground messages
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        // Handle token refresh
    }
}
