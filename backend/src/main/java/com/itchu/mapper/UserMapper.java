package com.itchu.mapper;

import com.itchu.domain.User;
import com.itchu.dto.user.UserResponse;

import java.util.List;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole(),
                MapperUtils.copyList(user.getCompetences()),
                user.isActif(),
                user.getDateCreation());
    }

    public static List<UserResponse> toResponseList(List<User> users) {
        return users.stream().map(UserMapper::toResponse).toList();
    }
}
