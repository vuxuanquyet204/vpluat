package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserDTO toDTO(User user);

    List<UserDTO> toDTOList(List<User> users);
}
