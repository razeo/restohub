package com.restohub.app;

import android.os.Bundle;
import android.view.WindowManager;

import com.capacitorjs.core.CapacitorActivity;

public class MainActivity extends CapacitorActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Keep screen on while using the app
        getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        
        // Initialize Capacitor
        init(
            savedInstanceState,
            this.getConfig(),
            new ArrayList<Class<? extends Plugin>>() {},
            new PluginMethodHandle() {}
        );

        // Load web app
        loadWebApp();
    }
}
