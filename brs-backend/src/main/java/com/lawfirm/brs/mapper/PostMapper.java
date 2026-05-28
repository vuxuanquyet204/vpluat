package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {UserMapper.class, CategoryMapper.class})
public interface PostMapper {

    @Named("postToDTO")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.slug")
    @Mapping(target = "status", expression = "java(post.getStatus().name())")
    PostDTO toDTO(Post post);

    @Named("postToDTOWithDetails")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.slug")
    @Mapping(target = "status", expression = "java(post.getStatus().name())")
    PostDTO toDTOWithDetails(Post post);

    List<PostDTO> toDTOList(List<Post> posts);
}
