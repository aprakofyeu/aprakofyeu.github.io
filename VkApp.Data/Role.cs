using System.Collections.Generic;
using System.Linq;

namespace VkApp.Data
{
    public static class Role
    {
        public const string User = "User";
        public const string Admin = "Admin";

        public static IEnumerable<string> AllRoles = new[] {User, Admin};

        public static IEnumerable<string> GelAvailableRoles(string role)
        {
            switch (role)
            {
                case User:
                    return new List<string> { User };
                case Admin:
                    return AllRoles;
                default:
                    return Enumerable.Empty<string>();
            }
        }
    }
}
