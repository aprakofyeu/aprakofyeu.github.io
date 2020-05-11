using System.Linq;
using VkApp.Data.DataProviders;

namespace VkApp.Web.Infrastructure
{
    public interface IAuthValidator
    {
        Permissions ValidateToken(AuthToken token);
    }

    public class AuthValidator: IAuthValidator
    {
        private readonly IUserRolesProvider _rolesProvider;

        public AuthValidator(IUserRolesProvider rolesProvider)
        {
            _rolesProvider = rolesProvider;
        }

        public Permissions ValidateToken(AuthToken token)
        {
            var passwords = _rolesProvider.GetRoles(token.Role);
            var role = passwords.FirstOrDefault(x => HashCalculator.Calculate(x.Password) == token.Token);

            if (role!=null)
            {
                return new Permissions
                {
                    AllowMessages = role.Messages,
                    AllowInvites = role.Invites,
                    AllowFindFriends = role.FindFriends,
                    AllowInstruments = role.Instruments
                };
            }

            return null;
        }
    }
}