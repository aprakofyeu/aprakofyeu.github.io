using System.Collections.Generic;
using VkApp.Data.Model;

namespace VkApp.Web.Models
{
    public class StatisticsView
    {
        public Group Group { get; set; }

        public IDictionary<int, User> UsersDict { get; set; }

        public IEnumerable<StatisticsGroup> StatisticsGroups { get; set; } 
    }

    public class StatisticsGroupEditView
    {
        public string ErrorMessage { get; set; }

        public Group Group { get; set; }

        public StatisticsGroup StatisticsGroup { get; set; }

        public IDictionary<int, User> UsersDict { get; set; }
    }
}