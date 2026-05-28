package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.ReviewDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.Review;
import com.lawfirm.brs.entity.ServiceEntity;
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
public class ReviewMapperImpl implements ReviewMapper {

    @Override
    public ReviewDTO toDTO(Review review) {
        if ( review == null ) {
            return null;
        }

        ReviewDTO.ReviewDTOBuilder reviewDTO = ReviewDTO.builder();

        reviewDTO.lawyerId( reviewLawyerId( review ) );
        reviewDTO.lawyerName( reviewLawyerNameVi( review ) );
        reviewDTO.serviceId( reviewServiceId( review ) );
        reviewDTO.serviceName( reviewServiceSlug( review ) );
        reviewDTO.id( review.getId() );
        reviewDTO.clientName( review.getClientName() );
        reviewDTO.clientRole( review.getClientRole() );
        reviewDTO.rating( review.getRating() );
        reviewDTO.isFeatured( review.getIsFeatured() );
        reviewDTO.isPublished( review.getIsPublished() );
        reviewDTO.source( review.getSource() );
        reviewDTO.createdAt( review.getCreatedAt() );

        return reviewDTO.build();
    }

    @Override
    public ReviewDTO toDTOWithDetails(Review review) {
        if ( review == null ) {
            return null;
        }

        ReviewDTO.ReviewDTOBuilder reviewDTO = ReviewDTO.builder();

        reviewDTO.lawyerId( reviewLawyerId( review ) );
        reviewDTO.lawyerName( reviewLawyerNameVi( review ) );
        reviewDTO.serviceId( reviewServiceId( review ) );
        reviewDTO.serviceName( reviewServiceSlug( review ) );
        reviewDTO.id( review.getId() );
        reviewDTO.clientName( review.getClientName() );
        reviewDTO.clientRole( review.getClientRole() );
        reviewDTO.rating( review.getRating() );
        reviewDTO.isFeatured( review.getIsFeatured() );
        reviewDTO.isPublished( review.getIsPublished() );
        reviewDTO.source( review.getSource() );
        reviewDTO.createdAt( review.getCreatedAt() );

        return reviewDTO.build();
    }

    @Override
    public List<ReviewDTO> toDTOList(List<Review> reviews) {
        if ( reviews == null ) {
            return null;
        }

        List<ReviewDTO> list = new ArrayList<ReviewDTO>( reviews.size() );
        for ( Review review : reviews ) {
            list.add( toDTO( review ) );
        }

        return list;
    }

    @Override
    public List<ReviewDTO> toDTOListWithDetails(List<Review> reviews) {
        if ( reviews == null ) {
            return null;
        }

        List<ReviewDTO> list = new ArrayList<ReviewDTO>( reviews.size() );
        for ( Review review : reviews ) {
            list.add( toDTO( review ) );
        }

        return list;
    }

    private UUID reviewLawyerId(Review review) {
        if ( review == null ) {
            return null;
        }
        LawyerProfile lawyer = review.getLawyer();
        if ( lawyer == null ) {
            return null;
        }
        UUID id = lawyer.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String reviewLawyerNameVi(Review review) {
        if ( review == null ) {
            return null;
        }
        LawyerProfile lawyer = review.getLawyer();
        if ( lawyer == null ) {
            return null;
        }
        String nameVi = lawyer.getNameVi();
        if ( nameVi == null ) {
            return null;
        }
        return nameVi;
    }

    private UUID reviewServiceId(Review review) {
        if ( review == null ) {
            return null;
        }
        ServiceEntity service = review.getService();
        if ( service == null ) {
            return null;
        }
        UUID id = service.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String reviewServiceSlug(Review review) {
        if ( review == null ) {
            return null;
        }
        ServiceEntity service = review.getService();
        if ( service == null ) {
            return null;
        }
        String slug = service.getSlug();
        if ( slug == null ) {
            return null;
        }
        return slug;
    }
}
