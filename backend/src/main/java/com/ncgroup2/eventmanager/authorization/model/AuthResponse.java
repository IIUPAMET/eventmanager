package com.ncgroup2.eventmanager.authorization.model;

public class AuthResponse {
    String token;

    public AuthResponse() {
    }

    public AuthResponse(String token) {

        this.token = token;
    }

    public String getToken() {

        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
