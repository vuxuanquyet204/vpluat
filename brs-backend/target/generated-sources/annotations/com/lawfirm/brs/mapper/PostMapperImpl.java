package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.entity.Category;
import com.lawfirm.brs.entity.Post;
import com.lawfirm.brs.entity.User;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-29T00:41:02+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class PostMapperImpl implements PostMapper {

    @Override
    public PostDTO toDTO(Post post) {
        if ( post == null ) {
            return null;
        }

        PostDTO.PostDTOBuilder postDTO = PostDTO.builder();

        postDTO.authorId( postAuthorId( post ) );
        postDTO.authorName( postAuthorFullName( post ) );
        postDTO.categoryId( postCategoryId( post ) );
        postDTO.categoryName( postCategorySlug( post ) );
        postDTO.id( post.getId() );
        postDTO.slug( post.getSlug() );
        postDTO.thumbnailUrl( post.getThumbnailUrl() );
        postDTO.publishedAt( post.getPublishedAt() );
        postDTO.scheduledAt( post.getScheduledAt() );
        postDTO.views( post.getViews() );
        postDTO.readingTime( post.getReadingTime() );
        postDTO.ogImageUrl( post.getOgImageUrl() );
        postDTO.isFeatured( post.getIsFeatured() );
        postDTO.language( post.getLanguage() );
        postDTO.createdAt( post.getCreatedAt() );
        postDTO.updatedAt( post.getUpdatedAt() );

        postDTO.status( post.getStatus().name() );

        return postDTO.build();
    }

    @Override
    public PostDTO toDTOWithDetails(Post post) {
        if ( post == null ) {
            return null;
        }

        PostDTO.PostDTOBuilder postDTO = PostDTO.builder();

        postDTO.authorId( postAuthorId( post ) );
        postDTO.authorName( postAuthorFullName( post ) );
        postDTO.categoryId( postCategoryId( post ) );
        postDTO.categoryName( postCategorySlug( post ) );
        postDTO.id( post.getId() );
        postDTO.slug( post.getSlug() );
        postDTO.thumbnailUrl( post.getThumbnailUrl() );
        postDTO.publishedAt( post.getPublishedAt() );
        postDTO.scheduledAt( post.getScheduledAt() );
        postDTO.views( post.getViews() );
        postDTO.readingTime( post.getReadingTime() );
        postDTO.ogImageUrl( post.getOgImageUrl() );
        postDTO.isFeatured( post.getIsFeatured() );
        postDTO.language( post.getLanguage() );
        postDTO.createdAt( post.getCreatedAt() );
        postDTO.updatedAt( post.getUpdatedAt() );

        postDTO.status( post.getStatus().name() );

        return postDTO.build();
    }

    @Override
    public List<PostDTO> toDTOList(List<Post> posts) {
        if ( posts == null ) {
            return null;
        }

        List<PostDTO> list = new ArrayList<PostDTO>( posts.size() );
        for ( Post post : posts ) {
            list.add( postToPostDTO( post ) );
        }

        return list;
    }

    private UUID postAuthorId(Post post) {
        if ( post == null ) {
            return null;
        }
        User author = post.getAuthor();
        if ( author == null ) {
            return null;
        }
        UUID id = author.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String postAuthorFullName(Post post) {
        if ( post == null ) {
            return null;
        }
        User author = post.getAuthor();
        if ( author == null ) {
            return null;
        }
        String fullName = author.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private UUID postCategoryId(Post post) {
        if ( post == null ) {
            return null;
        }
        Category category = post.getCategory();
        if ( category == null ) {
            return null;
        }
        UUID id = category.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String postCategorySlug(Post post) {
        if ( post == null ) {
            return null;
        }
        Category category = post.getCategory();
        if ( category == null ) {
            return null;
        }
        String slug = category.getSlug();
        if ( slug == null ) {
            return null;
        }
        return slug;
    }

    protected PostDTO postToPostDTO(Post post) {
        if ( post == null ) {
            return null;
        }

        PostDTO.PostDTOBuilder postDTO = PostDTO.builder();

        postDTO.id( post.getId() );
        postDTO.slug( post.getSlug() );
        postDTO.thumbnailUrl( post.getThumbnailUrl() );
        if ( post.getStatus() != null ) {
            postDTO.status( post.getStatus().name() );
        }
        postDTO.publishedAt( post.getPublishedAt() );
        postDTO.scheduledAt( post.getScheduledAt() );
        postDTO.views( post.getViews() );
        postDTO.readingTime( post.getReadingTime() );
        postDTO.ogImageUrl( post.getOgImageUrl() );
        postDTO.isFeatured( post.getIsFeatured() );
        postDTO.language( post.getLanguage() );
        postDTO.createdAt( post.getCreatedAt() );
        postDTO.updatedAt( post.getUpdatedAt() );

        return postDTO.build();
    }
}
