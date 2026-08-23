package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {UserMapper.class, CategoryMapper.class})
public interface PostMapper {

    @Named("postToDTO")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.slug")
    @Mapping(target = "status", expression = "java(post.getStatus().name())")
    @Mapping(target = "tags", expression = "java(mapTagSlugs(post))")
    @Mapping(target = "lawyerIds", expression = "java(mapLawyerIds(post))")
    PostDTO toDTO(Post post);

    @Named("postToDTOWithDetails")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.slug")
    @Mapping(target = "status", expression = "java(post.getStatus().name())")
    @Mapping(target = "tags", expression = "java(mapTagSlugs(post))")
    @Mapping(target = "lawyerIds", expression = "java(mapLawyerIds(post))")
    PostDTO toDTOWithDetails(Post post);

    List<PostDTO> toDTOList(List<Post> posts);

    /** Extract the list of tag slugs from the PostTag join rows. Guarded
     *  against uninitialised lazy collections so list endpoints (which don't
     *  fetch the join rows) don't NPE. */
    default List<String> mapTagSlugs(Post post) {
        if (post == null || post.getPostTags() == null) return Collections.emptyList();
        return post.getPostTags().stream()
            .map(pt -> pt.getTag() != null ? pt.getTag().getSlug() : null)
            .filter(s -> s != null)
            .collect(Collectors.toList());
    }

    default List<java.util.UUID> mapLawyerIds(Post post) {
        if (post == null || post.getPostTags() == null) return Collections.emptyList();
        return Collections.emptyList();
    }
}
