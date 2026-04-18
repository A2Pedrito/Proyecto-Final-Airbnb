using System.Collections.Generic;

namespace Airbnb.Application.DTOs.Review
{
    public class PropertyReviewsResponse
    {
        public double AverageRating { get; set; }
        public List<ReviewResponse> Reviews { get; set; } = new List<ReviewResponse>();
    }
}
